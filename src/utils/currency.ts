import { CURRENCY } from '../constants';

export const formatCurrency = (amount: number, currency = CURRENCY) => {
    return new Intl.NumberFormat('fr-CG', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
};
