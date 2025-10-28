export function formatMoney(value: number | string): string { 
    let val = value;
    if(typeof val !== 'number') {
        val = parseFloat(String(value).replace(/\./g, '').replace(',', '.'));
    }
    
    // Redondear correctamente: Math.round redondea .5 hacia arriba
    const rounded = Math.round(val * 100) / 100;
    
    return rounded.toLocaleString('es-AR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}