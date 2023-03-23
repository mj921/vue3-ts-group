import axios, { type AxiosRequestConfig } from 'axios';

export const useComponent = ['suo-web-all'];

export default async function request<ResultType>(
  url: string,
  method: string,
  data: any,
  headers: any,
  isFormData = false
): Promise<ResultType> {
  const appCode = 'comchat';

  return new Promise((resolve, reject) => {
    let params = {};
    if (method.toLocaleLowerCase() === 'get') {
      params = data;
    }
    axios({
      url,
      method,
      headers,
      data,
      params,
    })
      .then((response) => {
        const { data, status } = response;
        if (status !== 200) {
          return reject(response);
        } else {
          return resolve(data);
        }
      })
      .catch((error) => {
        const { response } = error || {};
        const { data } = response || {};
        return reject(data || {});
      });
  });
}
