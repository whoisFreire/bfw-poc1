class UserProfile {
    constructor(name, age, gender, cpf, cep, street, district, city, country) {
        this.name = name;
        this.age = age;
        this.gender = gender;
        this.cpf = cpf;
        this.address = {
            cep,
            street,
            district,
            city,
            country
        };
    }
}

module.exports.UserProfile = UserProfile;
