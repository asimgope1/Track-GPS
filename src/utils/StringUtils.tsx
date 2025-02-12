export function isNullValue(value: any) {
  return (
    value === null ||
    value === undefined ||
    (typeof value === 'string' ? value.trim() : value) === ''
  );
}

export function isValidEmailId(string: any) {
  var re =
    /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(string);
}

export function isValidMobileNumber(string: any) {
  var re = /^[6-9]{1}[0-9]{9}$/;
  return re.test(string);
}

export function isValidPANNumber(string: any) {
  var re = /[A-Z]{5}[0-9]{4}[A-Z]{1}/;
  return re.test(string);
}

export function isValidAadharNumber(string: any) {
  // Aadhar number should have 12 digits.
  // Aadhar number should not start with 0 and 1.
  // Aadhar number should not contain any alphabet and special characters.
  // var re = /^[2-9]{1}[0-9]{3}\\s[0-9]{4}[0-9]{4}$/;
  var re = /^[2-9]{1}[0-9]{3}[0-9]{4}[0-9]{4}$/;
  return re.test(string);
}

export function capitalizedByWord(value: any) {
  // \s matches a whitespace character
  // \S matches a non - whitespace character
  //     (x | y) matches any of the specified alternatives
  return value != undefined && value != null
    ? value.replace(/[^A-Z0-9]/g, (l: any) => l.toUpperCase())
    : '';
}

export function numericOnly(value: string) {
  // \s matches a whitespace character
  // \S matches a non - whitespace character
  //     (x | y) matches any of the specified alternatives
  return value.replace(/\D/g, '');
}

export function hasNumber(myString: string) {
  return isNullValue(myString) ? false : /\d/.test(myString);
}

export function isEqualObject(a: any, b: any) {
  try {
    return JSON.stringify(a) === JSON.stringify(b);
  } catch (error) {
    return false;
  }
}

export function checkPasswordComplexity(pwd: string) {
  var smallLetter = /[a-z]/;
  var capitalLetter = /[A-Z]/;
  var number = /[0-9]/;
  var valid =
    number.test(pwd) && smallLetter.test(pwd) && capitalLetter.test(pwd); //match a letter _and_ a number
  return valid;
}

export function isEmptyObject(obj: object) {
  for (var prop in obj) {
    if (obj.hasOwnProperty(prop)) {
      return false;
    }
  }
  return JSON.stringify(obj) === JSON.stringify({});
}
