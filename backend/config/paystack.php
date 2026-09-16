<?php
/**
 * Paystack Payment Gateway Integration
 * HoneyMilk Cakes and Steeze
 */

declare(strict_types=1);

namespace HoneyMilk\Config;

class Paystack {
    private static function getSecretKey(): string {
        return getenv('PAYSTACK_SECRET_KEY') ?: 'sk_test_mock_honeymilk_secret_key';
    }

    public static function initializeTransaction(string $email, int $amountInKobo, string $reference, string $callbackUrl, array $metadata = []): array {
        $secretKey = self::getSecretKey();

        // If mock / test key without network, return simulated response for local development
        if (str_starts_with($secretKey, 'sk_test_mock')) {
            return [
                'status' => true,
                'message' => 'Authorization URL created (Development Simulation)',
                'data' => [
                    'authorization_url' => $callbackUrl . (str_contains($callbackUrl, '?') ? '&' : '?') . 'reference=' . urlencode($reference) . '&status=success',
                    'access_code' => 'sim_' . bin2hex(random_bytes(8)),
                    'reference' => $reference
                ]
            ];
        }

        $url = "https://api.paystack.co/transaction/initialize";
        $fields = [
            'email' => $email,
            'amount' => $amountInKobo,
            'reference' => $reference,
            'callback_url' => $callbackUrl,
            'metadata' => $metadata
        ];

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($fields));
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            "Authorization: Bearer {$secretKey}",
            "Cache-Control: no-cache",
            "Content-Type: application/json"
        ]);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        $response = curl_exec($ch);
        $err = curl_error($ch);
        curl_close($ch);

        if ($err) {
            return ['status' => false, 'message' => "Paystack error: " . $err];
        }

        return json_decode($response, true) ?: ['status' => false, 'message' => 'Invalid response from Paystack'];
    }

    public static function verifyTransaction(string $reference): array {
        $secretKey = self::getSecretKey();

        // Local development simulation
        if (str_starts_with($secretKey, 'sk_test_mock')) {
            return [
                'status' => true,
                'message' => 'Verification successful (Simulation)',
                'data' => [
                    'status' => 'success',
                    'reference' => $reference,
                    'gateway_response' => 'Successful (Dev Simulation)',
                    'paid_at' => date('Y-m-d H:i:s')
                ]
            ];
        }

        $url = "https://api.paystack.co/transaction/verify/" . rawurlencode($reference);
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            "Authorization: Bearer {$secretKey}",
            "Cache-Control: no-cache"
        ]);
        $response = curl_exec($ch);
        $err = curl_error($ch);
        curl_close($ch);

        if ($err) {
            return ['status' => false, 'message' => "Paystack verification error: " . $err];
        }

        return json_decode($response, true) ?: ['status' => false, 'message' => 'Invalid response from Paystack'];
    }

    public static function verifyWebhookSignature(string $payload, string $signatureHeader): bool {
        $secretKey = self::getSecretKey();
        return hash_equals(hash_hmac('sha512', $payload, $secretKey), $signatureHeader);
    }
}
