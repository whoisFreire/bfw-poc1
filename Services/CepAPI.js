const axios = require('axios').default;

class CepApi {
    constructor() {
        this.client = axios.create({
            baseURL: 'https://viacep.com.br'
        });
    }

    async fetch(cep) {
        try {
            const response = await this.client.get('/ws/' + cep + '/json');
            return response;
        } catch (err) {
            console.log(err);
        }
    }
}

module.exports.CepApi = CepApi;
