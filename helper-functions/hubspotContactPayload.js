const properties = [
  "email",

  "firstname",

  "lastname",

  "website",

  "company",

  "phone",

  "address",

  "city",

  "state",

  "zip"
];

module.exports = function(data) {
  const properyArray = Object.keys(data).reduce((acc, property) => {
    const keyValue = data[property];

    if (property === "id") {
      return acc;
    }
    if (properties.includes(property.toLowerCase())) {
      return acc.concat({ property: property.toLowerCase(), value: keyValue });
    }
    return acc;
  }, []);

  return {
    properties: [...properyArray]
  };
};
