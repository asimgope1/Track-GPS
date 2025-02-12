import {getObjByKey} from './Storage';
export const POSTNETWORK = async (
  url,
  payload,
  token = false,
  content = false,
) => {
  let headers = {
    Accept: 'application/json',
    'Content-Type': content ? 'multipart/form-data' : 'application/json',
  };

  console.log('url, payload, token', url, payload, token);
  if (token) {
    let loginRes = await getObjByKey('loginResponse');
    headers = {
      ...headers,
      Authorization: `Bearer ${loginRes?.data?.access_token}`,
    };
  }
  // console.log('HEADERS: ', headers);
  return await fetch(url, {
    method: 'POST',
    headers: headers,
    body: JSON.stringify(payload),
  })
    .then(response => response.json())
    .then(response => {
      return response;
    })
    .catch(error => {
      console.error('error' + error);
    });
};

export const PUTNETWORK = async (
  url,
  payload,
  token = false,
  content = false,
) => {
  let headers = {
    Accept: 'application/json',
    'Content-Type': content ? 'multipart/form-data' : 'application/json',
  };
  if (token) {
    let loginRes = await getObjByKey('loginResponse');
    headers = {
      ...headers,
      Authorization: `Bearer ${loginRes?.data?.access_token}`,
    };
  }
  // console.log("HEADERS: ", headers);
  return await fetch(url, {
    method: 'PUT',
    headers: headers,
    body: JSON.stringify(payload),
  })
    .then(response => response.json())
    .then(response => {
      return response;
    })
    .catch(error => {
      console.error('error' + error);
    });
};

export const GETNETWORK = async (url, token = false) => {
  let headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };

  if (token) {
    let loginRes = await getObjByKey('loginResponse');
    console.log('allresponse', loginRes);
    headers = {
      ...headers,
      Authorization: `Bearer ${loginRes?.data?.access_token}`,
    };
  }
  // console.log(headers);
  return fetch(url, {
    method: 'GET',
    headers: headers,
  })
    .then(response => response.json())
    .then(response => {
      return response;
    })
    .catch(error => {
      console.error(error);
    });
};
