

export function Discount(sum, discount) {
    if (discount === 0) { return sum; } 
    return sum - (sum * (discount * 0.01))
}