/** @type {import('./$types').PageServerLoad} */
export async function load({ parent }) {
    const { currencyData } = await parent();
    return {
        currencyData
    };
}
