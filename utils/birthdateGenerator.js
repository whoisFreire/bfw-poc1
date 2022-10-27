module.exports = function birthdateGenerator(birthdate, age) {
    // eslint-disable-next-line no-unused-vars
    const [day, month] = birthdate.split('/');
    const userAge = age.split(' ')[0];
    const year = new Date().getFullYear() - userAge;
    return `${ day }/${ month }/${ year }`;
};
