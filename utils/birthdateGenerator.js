module.exports = function birthdateGenerator(birthdate, age) {
    // eslint-disable-next-line no-unused-vars
    const [day, month] = birthdate.split('/');
    const year = new Date().getFullYear() - age;
    return `${ day }/${ month }/${ year }`;
};
