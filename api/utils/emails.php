<?php

function sendOrderEmail($to, $subject, $content) {
    // In a real production environment, you would use PHPMailer or a service like SendGrid/Mailgun.
    // For this demonstration, we'll log the email to a file and attempt to use PHP's mail() function.
    
    $logDir = __DIR__ . '/../../logs';
    if (!is_dir($logDir)) {
        mkdir($logDir, 0777, true);
    }
    
    $logFile = $logDir . '/emails.log';
    $timestamp = date('Y-m-d H:i:s');
    
    $logEntry = "[$timestamp] TO: $to | SUBJECT: $subject\n";
    $logEntry .= "CONTENT:\n$content\n";
    $logEntry .= "------------------------------------------------------------\n";
    
    file_put_contents($logFile, $logEntry, FILE_APPEND);
    
    // Attempt actual sending (might fail on local XAMPP without configuration)
    $headers = "MIME-Version: 1.0" . "\r\n";
    $headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
    $headers .= 'From: <comenzi@piata-locala.ro>' . "\r\n";
    
    try {
        @mail($to, $subject, $content, $headers);
        return true;
    } catch (Exception $e) {
        return false;
    }
}

function getCustomerOrderTemplate($orderData, $items) {
    $itemsHtml = '';
    foreach ($items as $item) {
        $subtotal = $item['price'] * $item['quantity'];
        $itemsHtml .= "
            <tr>
                <td style='padding: 10px; border-bottom: 1px solid #eeeeee;'>{$item['title']}</td>
                <td style='padding: 10px; border-bottom: 1px solid #eeeeee; text-align: center;'>{$item['quantity']}</td>
                <td style='padding: 10px; border-bottom: 1px solid #eeeeee; text-align: right;'>".number_format($subtotal, 2)." Lei</td>
            </tr>
        ";
    }

    return "
    <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 10px; overflow: hidden;'>
        <div style='background: #27ae60; padding: 20px; text-align: center; color: white;'>
            <h1 style='margin: 0;'>Piața Producătorilor Locali</h1>
            <p style='margin: 5px 0 0;'>Comanda ta a fost primită!</p>
        </div>
        <div style='padding: 30px;'>
            <p>Bună, <strong>{$orderData['customer_name']}</strong>,</p>
            <p>Îți mulțumim pentru comandă! Producătorii noștri au fost notificați și vor începe pregătirea produselor proaspete pentru tine.</p>
            
            <h3 style='border-bottom: 2px solid #27ae60; padding-bottom: 5px; color: #2c3e50;'>Sumar Comandă</h3>
            <table style='width: 100%; border-collapse: collapse;'>
                <thead>
                    <tr style='background: #f8f9fa;'>
                        <th style='padding: 10px; text-align: left;'>Produs</th>
                        <th style='padding: 10px; text-align: center;'>Cant.</th>
                        <th style='padding: 10px; text-align: right;'>Total</th>
                    </tr>
                </thead>
                <tbody>
                    $itemsHtml
                </tbody>
                <tfoot>
                    <tr>
                        <td colspan='2' style='padding: 20px 10px 10px; font-weight: bold; text-align: right;'>TOTAL:</td>
                        <td style='padding: 20px 10px 10px; font-weight: bold; text-align: right; color: #27ae60; font-size: 1.25rem;'>".number_format($orderData['total_amount'], 2)." Lei</td>
                    </tr>
                </tfoot>
            </table>

            <div style='margin-top: 30px; padding: 20px; background: #fdfae6; border-radius: 8px;'>
                <h4 style='margin: 0 0 10px; color: #856404;'>Informații Livrare</h4>
                <p style='margin: 0; font-size: 0.9rem;'>
                    <strong>Adresă:</strong> {$orderData['delivery_city']}, {$orderData['delivery_county']}, {$orderData['delivery_address']}<br>
                    <strong>Telefon:</strong> {$orderData['customer_phone']}<br>
                    <strong>Metodă Plată:</strong> ".($orderData['payment_method'] == 'cash' ? 'Ramburs (Cash la livrare)' : 'Card Online')."
                </p>
            </div>

            <p style='margin-top: 30px; font-size: 0.85rem; color: #7f8c8d; text-align: center;'>
                Dacă ai întrebări, te rugăm să ne contactezi la suport@piata-locala.ro
            </p>
        </div>
        <div style='background: #f8f9fa; padding: 15px; text-align: center; font-size: 0.8rem; color: #95a5a6;'>
            © 2026 Piața Producătorilor Locali. Toate drepturile rezervate.
        </div>
    </div>
    ";
}

function getProducerOrderTemplate($producerName, $customerData, $producerItems) {
    $itemsHtml = '';
    $producerTotal = 0;
    foreach ($producerItems as $item) {
        $subtotal = $item['price'] * $item['quantity'];
        $producerTotal += $subtotal;
        $itemsHtml .= "
            <tr>
                <td style='padding: 10px; border-bottom: 1px solid #eeeeee;'>{$item['title']}</td>
                <td style='padding: 10px; border-bottom: 1px solid #eeeeee; text-align: center;'>{$item['quantity']}</td>
                <td style='padding: 10px; border-bottom: 1px solid #eeeeee; text-align: right;'>".number_format($subtotal, 2)." Lei</td>
            </tr>
        ";
    }

    return "
    <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 10px; overflow: hidden;'>
        <div style='background: #2980b9; padding: 20px; text-align: center; color: white;'>
            <h1 style='margin: 0;'>Comandă Nouă!</h1>
            <p style='margin: 5px 0 0;'>Ai primit o comandă pentru produsele tale.</p>
        </div>
        <div style='padding: 30px;'>
            <p>Bună, <strong>$producerName</strong>,</p>
            <p>Un client a plasat o comandă care include produsele tale pe platforma Piața Producătorilor Locali.</p>
            
            <h3 style='border-bottom: 2px solid #2980b9; padding-bottom: 5px; color: #2c3e50;'>Detalii Client</h3>
            <p style='margin: 0;'><strong>Nume:</strong> {$customerData['customer_name']}</p>
            <p style='margin: 0;'><strong>Telefon:</strong> {$customerData['customer_phone']}</p>
            <p style='margin: 0;'><strong>Email:</strong> {$customerData['customer_email']}</p>
            <p style='margin: 0;'><strong>Adresă Livrare:</strong> {$customerData['delivery_city']}, {$customerData['delivery_county']}, {$customerData['delivery_address']}</p>

            <h3 style='border-bottom: 2px solid #2980b9; padding-bottom: 5px; color: #2c3e50; margin-top: 25px;'>Produsele Comandate</h3>
            <table style='width: 100%; border-collapse: collapse;'>
                <thead>
                    <tr style='background: #f8f9fa;'>
                        <th style='padding: 10px; text-align: left;'>Produs</th>
                        <th style='padding: 10px; text-align: center;'>Cant.</th>
                        <th style='padding: 10px; text-align: right;'>Subtotal</th>
                    </tr>
                </thead>
                <tbody>
                    $itemsHtml
                </tbody>
                <tfoot>
                    <tr>
                        <td colspan='2' style='padding: 20px 10px 10px; font-weight: bold; text-align: right;'>TOTALUL TĂU:</td>
                        <td style='padding: 20px 10px 10px; font-weight: bold; text-align: right; color: #2980b9; font-size: 1.25rem;'>".number_format($producerTotal, 2)." Lei</td>
                    </tr>
                </tfoot>
            </table>

            <div style='margin-top: 30px; text-align: center;'>
                <a href='http://localhost/producer-dashboard.html' style='background: #2980b9; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;'>Vezi în Dashboard</a>
            </div>

            <p style='margin-top: 30px; font-size: 0.85rem; color: #7f8c8d;'>Te rugăm să contactezi clientul pentru confirmarea detaliilor de livrare.</p>
        </div>
        <div style='background: #f8f9fa; padding: 15px; text-align: center; font-size: 0.8rem; color: #95a5a6;'>
            © 2026 Piața Producătorilor Locali - Panoul Producătorului
        </div>
    </div>
    ";
}

function getStatusUpdateTemplate($customerName, $orderId, $newStatus) {
    $statusText = '';
    $statusColor = '';
    $message = '';
    
    switch($newStatus) {
        case 'processing': 
            $statusText = 'În Procesare'; 
            $statusColor = '#f39c12';
            $message = 'Comanda ta este acum în faza de procesare. Producătorul pregătește produsele.';
            break;
        case 'completed': 
            $statusText = 'Finalizată / Livrată'; 
            $statusColor = '#27ae60';
            $message = 'Veste bună! Comanda ta a fost finalizată și este în drum spre tine sau a fost deja livrată.';
            break;
        case 'cancelled': 
            $statusText = 'Anulată'; 
            $statusColor = '#e74c3c';
            $message = 'Ne pare rău, comanda ta a fost anulată. Te rugăm să contactezi producătorul pentru detalii.';
            break;
        default: 
            $statusText = $newStatus; 
            $statusColor = '#34495e';
            $message = 'Statusul comenzii tale a fost actualizat.';
    }

    return "
    <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 10px; overflow: hidden;'>
        <div style='background: $statusColor; padding: 20px; text-align: center; color: white;'>
            <h1 style='margin: 0;'>Actualizare Comandă #$orderId</h1>
        </div>
        <div style='padding: 30px;'>
            <p>Bună, <strong>$customerName</strong>,</p>
            <p>$message</p>
            
            <div style='margin: 20px 0; padding: 20px; background: #f8f9fa; border-top: 4px solid $statusColor; text-align: center;'>
                <span style='font-size: 0.9rem; text-transform: uppercase; color: #7f8c8d;'>Status Nou:</span><br>
                <strong style='font-size: 1.5rem; color: $statusColor;'>$statusText</strong>
            </div>

            <p style='margin-top: 30px; font-size: 0.85rem; color: #7f8c8d; text-align: center;'>
                Mulțumim că alegi producătorii locali!
            </p>
        </div>
        <div style='background: #f8f9fa; padding: 15px; text-align: center; font-size: 0.8rem; color: #95a5a6;'>
            © 2026 Piața Producătorilor Locali.
        </div>
    </div>
    ";
}
