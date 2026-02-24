import type { Pedido } from '../../../services/fetchPedidos';

export function printPedido(pedido: Pedido) {
    const fecha = new Date(pedido.dateCreated).toLocaleString('es-AR');
    const total = (pedido.totalPrice ?? pedido.totalAmount ?? 0).toFixed(2);

    const itemsHtml = pedido.items.map(item => {
        const qty = item.itemQuantity ?? item.quantity;
        const name = item.itemName ?? item.productName;
        const price = (item.itemPrice ?? item.unitPrice ?? 0).toFixed(2);
        const subtotal = (qty * (item.itemPrice ?? item.unitPrice ?? 0)).toFixed(2);
        return `
            <tr>
                <td>${qty}x ${name}</td>
                <td style="text-align:right">$${subtotal}</td>
            </tr>
            <tr>
                <td colspan="2" style="font-size:10px; color:#555; padding-bottom:4px">
                    &nbsp;&nbsp;&nbsp;$${price} c/u
                </td>
            </tr>
        `;
    }).join('');

    const clienteHtml = (pedido.userName || pedido.userPhone) ? `
        <tr><td colspan="2" style="padding-top:8px; border-top:1px dashed #000">
            ${pedido.userName ? `<div><b>Cliente:</b> ${pedido.userName}</div>` : ''}
            ${pedido.userPhone ? `<div><b>Tel:</b> ${pedido.userPhone}</div>` : ''}
        </td></tr>
    ` : '';

    const deliveryHtml = pedido.isDelivery && pedido.deliveryAddress ? `
        <tr><td colspan="2">
            <b>Delivery:</b> ${pedido.deliveryAddress}
        </td></tr>
    ` : '';

    const modoPedido = pedido.isDelivery ? '[ DELIVERY ]' : '[ RETIRA EN LOCAL ]';

    const estadoPago = pedido.paidWithMercadoPago
        ? '✓ PAGADO - MercadoPago'
        : pedido.paidWithCash
        ? '✓ PAGADO - Efectivo'
        : '✗ PENDIENTE DE PAGO';

    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Pedido #${pedido.id.slice(0, 8)}</title>
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body {
                    font-family: 'Courier New', monospace;
                    font-size: 12px;
                    width: 72mm;
                    padding: 4mm;
                    color: #000;
                }
                h2 { font-size: 16px; text-align: center; margin-bottom: 4px; }
                .center { text-align: center; }
                .separator { border: none; border-top: 1px dashed #000; margin: 6px 0; }
                table { width: 100%; border-collapse: collapse; }
                td { padding: 2px 0; vertical-align: top; }
                .total-row td {
                    font-size: 14px;
                    font-weight: bold;
                    border-top: 1px dashed #000;
                    padding-top: 6px;
                }
                .modo { font-weight: bold; font-size: 13px; text-align: center; margin: 4px 0; }
                .pago-ok { font-weight: bold; }
                .pago-pendiente { font-weight: bold; }
                @media print {
                    @page { margin: 0; size: 80mm auto; }
                }
            </style>
        </head>
        <body>
            <h2>PEDIDO</h2>
            <p class="center">#${pedido.id.slice(0, 8)}</p>
            <p class="center" style="font-size:10px; margin-top:2px">${fecha}</p>

            <hr class="separator">

            <p class="modo">${modoPedido}</p>

            <hr class="separator">

            <table>
                ${clienteHtml}
                ${deliveryHtml}
                ${(pedido.userName || pedido.userPhone || (pedido.isDelivery && pedido.deliveryAddress))
                    ? '<tr><td colspan="2" style="padding:4px 0"><hr class="separator"></td></tr>'
                    : ''}
                ${itemsHtml}
                <tr class="total-row">
                    <td>TOTAL</td>
                    <td style="text-align:right">$${total}</td>
                </tr>
                <tr>
                    <td colspan="2" style="padding-top:6px; font-size:11px" class="${pedido.paidWithMercadoPago || pedido.paidWithCash ? 'pago-ok' : 'pago-pendiente'}">
                        ${estadoPago}
                    </td>
                </tr>
            </table>

            <hr class="separator" style="margin-top:10px">
            <p class="center" style="font-size:10px">Gracias por su pedido</p>
        </body>
        </html>
    `;

    openPrintWindow(html);
}

export function printCocina(pedido: Pedido) {
    const fecha = new Date(pedido.dateCreated).toLocaleString('es-AR');
    const modoPedido = pedido.isDelivery ? '★ DELIVERY ★' : '→ RETIRA EN LOCAL';

    const itemsHtml = pedido.items.map(item => {
        const qty = item.itemQuantity ?? item.quantity;
        const name = item.itemName ?? item.productName;
        return `<tr><td class="qty">${qty}x</td><td class="name">${name}</td></tr>`;
    }).join('');

    const clienteHtml = pedido.userName
        ? `<p class="cliente">Cliente: ${pedido.userName}</p>`
        : '';

    const deliveryHtml = pedido.isDelivery && pedido.deliveryAddress
        ? `<p class="direccion">Dir: ${pedido.deliveryAddress}</p>`
        : '';

    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Cocina - Pedido #${pedido.id.slice(0, 8)}</title>
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body {
                    font-family: 'Courier New', monospace;
                    font-size: 14px;
                    width: 72mm;
                    padding: 4mm;
                    color: #000;
                }
                h2 { font-size: 20px; text-align: center; margin-bottom: 2px; }
                .num { font-size: 28px; font-weight: bold; text-align: center; }
                .modo { font-size: 15px; font-weight: bold; text-align: center; margin: 6px 0; }
                .separator { border: none; border-top: 1px dashed #000; margin: 6px 0; }
                .hora { font-size: 10px; text-align: center; color: #333; }
                .cliente { font-size: 12px; margin: 4px 0; }
                .direccion { font-size: 11px; margin: 2px 0; }
                table { width: 100%; border-collapse: collapse; margin-top: 6px; }
                td { padding: 3px 0; vertical-align: top; }
                td.qty { font-size: 18px; font-weight: bold; width: 30px; }
                td.name { font-size: 14px; font-weight: bold; }
                @media print {
                    @page { margin: 0; size: 80mm auto; }
                }
            </style>
        </head>
        <body>
            <h2>COCINA</h2>
            <p class="num">#${pedido.id.slice(0, 8)}</p>
            <p class="hora">${fecha}</p>
            <hr class="separator">
            <p class="modo">${modoPedido}</p>
            ${clienteHtml}
            ${deliveryHtml}
            <hr class="separator">
            <table>${itemsHtml}</table>
        </body>
        </html>
    `;

    openPrintWindow(html);
}

function openPrintWindow(html: string) {
    const win = window.open('', '_blank', 'width=340,height=500');
    if (!win) return;
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => {
        win.print();
        win.close();
    }, 300);
}
