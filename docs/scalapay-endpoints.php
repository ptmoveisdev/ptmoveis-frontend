<?php
/**
 * PT Móveis — Endpoints REST Scalapay
 *
 * Substituir o snippet anterior scalapay-checkout-url.
 * Inclui:
 *  - POST /wp-json/ptmoveis/v1/scalapay-checkout-url  → cria ordem Scalapay e devolve checkout URL
 *  - POST /wp-json/ptmoveis/v1/scalapay-capture        → captura pagamento após redirect do portal
 *
 * Instalar: adicionar ao functions.php ou como plugin snippet (Code Snippets, etc.)
 */

add_action( 'rest_api_init', function () {

    register_rest_route( 'ptmoveis/v1', '/scalapay-checkout-url', [
        'methods'             => 'POST',
        'callback'            => 'ptmoveis_scalapay_checkout_url',
        'permission_callback' => '__return_true',
    ] );

    register_rest_route( 'ptmoveis/v1', '/scalapay-capture', [
        'methods'             => 'POST',
        'callback'            => 'ptmoveis_scalapay_capture',
        'permission_callback' => '__return_true',
    ] );

} );

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Lê a API key e o ambiente do gateway Scalapay configurado no WooCommerce.
 * Devolve [ 'api_key' => '...', 'is_sandbox' => bool, 'base_url' => '...' ]
 */
function ptmoveis_scalapay_config(): array {
    $settings  = get_option( 'woocommerce_scalapay_settings', [] );

    // Tentativas de chaves comuns entre plugins Scalapay para WooCommerce
    $api_key = $settings['secret_key']
        ?? $settings['api_key']
        ?? $settings['merchant_key']
        ?? '';

    $is_sandbox = isset( $settings['sandbox'] ) && $settings['sandbox'] === 'yes';

    return [
        'api_key'    => $api_key,
        'is_sandbox' => $is_sandbox,
        'base_url'   => $is_sandbox
            ? 'https://integration.api.scalapay.com'
            : 'https://api.scalapay.com',
    ];
}

// ---------------------------------------------------------------------------
// POST /wp-json/ptmoveis/v1/scalapay-checkout-url
// Body: { order_id: number, scalapay_order_data?: object }
// ---------------------------------------------------------------------------

function ptmoveis_scalapay_checkout_url( WP_REST_Request $request ) {
    $order_id          = intval( $request->get_param( 'order_id' ) );
    $scalapay_data     = $request->get_param( 'scalapay_order_data' );

    if ( ! $order_id ) {
        return new WP_Error( 'missing_order_id', 'order_id é obrigatório.', [ 'status' => 400 ] );
    }

    $order = wc_get_order( $order_id );
    if ( ! $order ) {
        return new WP_Error( 'order_not_found', 'Encomenda não encontrada.', [ 'status' => 404 ] );
    }

    // Se o frontend enviou o payload formatado, usa-o diretamente na API Scalapay
    if ( ! empty( $scalapay_data ) && is_array( $scalapay_data ) ) {
        $config = ptmoveis_scalapay_config();

        if ( empty( $config['api_key'] ) ) {
            // Fallback: deixa o plugin WC tratar (comportamento anterior)
            return ptmoveis_scalapay_via_gateway( $order, $order_id );
        }

        $response = wp_remote_post(
            $config['base_url'] . '/v2/orders',
            [
                'headers' => [
                    'Content-Type'  => 'application/json',
                    'Authorization' => 'Bearer ' . $config['api_key'],
                ],
                'body'    => wp_json_encode( $scalapay_data ),
                'timeout' => 20,
            ]
        );

        if ( is_wp_error( $response ) ) {
            return new WP_Error(
                'scalapay_request_failed',
                $response->get_error_message(),
                [ 'status' => 502 ]
            );
        }

        $body = json_decode( wp_remote_retrieve_body( $response ), true );
        $http = wp_remote_retrieve_response_code( $response );

        if ( $http !== 200 || empty( $body['checkoutUrl'] ) ) {
            return new WP_Error(
                'scalapay_error',
                'Não foi possível criar a ordem Scalapay.',
                [ 'status' => 500, 'scalapay_error' => $body ]
            );
        }

        // Guarda o token Scalapay na encomenda WC para referência futura
        if ( ! empty( $body['token'] ) ) {
            $order->update_meta_data( '_scalapay_token', sanitize_text_field( $body['token'] ) );
            $order->save();
        }

        return rest_ensure_response( [ 'checkout_url' => $body['checkoutUrl'] ] );
    }

    // Fallback: sem scalapay_order_data → comportamento anterior via process_payment()
    return ptmoveis_scalapay_via_gateway( $order, $order_id );
}

/**
 * Fallback: usa o gateway WooCommerce Scalapay para obter o URL de checkout.
 */
function ptmoveis_scalapay_via_gateway( WC_Order $order, int $order_id ) {
    $gateway_id = $order->get_payment_method();
    $gateways   = WC()->payment_gateways()->payment_gateways();

    if ( ! isset( $gateways[ $gateway_id ] ) ) {
        return new WP_Error( 'gateway_not_found', "Gateway '{$gateway_id}' não encontrado.", [ 'status' => 404 ] );
    }

    $result = $gateways[ $gateway_id ]->process_payment( $order_id );

    if ( isset( $result['result'] ) && $result['result'] === 'success' && ! empty( $result['redirect'] ) ) {
        return rest_ensure_response( [ 'checkout_url' => $result['redirect'] ] );
    }

    return new WP_Error( 'scalapay_error', 'Não foi possível obter o URL de pagamento Scalapay.', [ 'status' => 500 ] );
}

// ---------------------------------------------------------------------------
// POST /wp-json/ptmoveis/v1/scalapay-capture
// Body: { order_id: number, order_token: string }
// ---------------------------------------------------------------------------

function ptmoveis_scalapay_capture( WP_REST_Request $request ) {
    $order_id    = intval( $request->get_param( 'order_id' ) );
    $order_token = sanitize_text_field( $request->get_param( 'order_token' ) );

    if ( ! $order_id || ! $order_token ) {
        return new WP_Error( 'missing_params', 'order_id e order_token são obrigatórios.', [ 'status' => 400 ] );
    }

    $order = wc_get_order( $order_id );
    if ( ! $order ) {
        return new WP_Error( 'order_not_found', 'Encomenda não encontrada.', [ 'status' => 404 ] );
    }

    // Evita capture duplo
    if ( $order->get_status() === 'processing' || $order->get_status() === 'completed' ) {
        return rest_ensure_response( [ 'success' => true, 'already_captured' => true ] );
    }

    $config = ptmoveis_scalapay_config();

    if ( empty( $config['api_key'] ) ) {
        // Sem API key: marca a encomenda manualmente e avisa
        $order->update_status( 'processing', 'Scalapay: pagamento confirmado (capture sem API key).' );
        return rest_ensure_response( [ 'success' => true ] );
    }

    $response = wp_remote_post(
        $config['base_url'] . '/v2/payments/capture',
        [
            'headers' => [
                'Content-Type'  => 'application/json',
                'Authorization' => 'Bearer ' . $config['api_key'],
            ],
            'body'    => wp_json_encode( [ 'token' => $order_token ] ),
            'timeout' => 20,
        ]
    );

    if ( is_wp_error( $response ) ) {
        return new WP_Error(
            'capture_request_failed',
            $response->get_error_message(),
            [ 'status' => 502 ]
        );
    }

    $body = json_decode( wp_remote_retrieve_body( $response ), true );
    $http = wp_remote_retrieve_response_code( $response );

    if ( $http !== 200 ) {
        return new WP_Error(
            'capture_failed',
            'Capture Scalapay falhou.',
            [ 'status' => 500, 'scalapay_error' => $body ]
        );
    }

    // Marca a encomenda como paga/em processamento
    $order->payment_complete( $order_token );
    $order->add_order_note( 'Scalapay: pagamento capturado. Token: ' . $order_token );

    return rest_ensure_response( [ 'success' => true ] );
}
