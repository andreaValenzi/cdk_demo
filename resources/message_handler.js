exports.main = async function (event, context) {
    event.Records.forEach(record => {
        const { body } = record;
        console.log(body);
    });
    return {};
};