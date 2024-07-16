import {API_URL, aborted_request, endpoints, gen_error} from './types';

/**
 *
 * @param method 'get' | 'post'
 * @param endpoint endpoints
 * @param parameters P
 * @param additionalParams string[]
 * @param token string?
 * @param signal AbortSignal?
 * @returns R | gen_error | aborted_request | null
 */

export async function mangadexAPI<R, P extends Object>(
  method: 'get' | 'post',
  endpoint: endpoints,
  parameters: P,
  additionalParams: string[],
  token?: string,
  signal?: AbortSignal,
): Promise<R | gen_error | aborted_request | null> {
  let request = API_URL + endpoint;

  if (Object.keys(parameters).length > 0) {
    request += '?';
  }

  if (additionalParams.length > 0) {
    additionalParams.forEach(param => {
      request = request.replace('$', param);
    });
  }

  if (method === 'post') {
    try {
      const res = await fetch(request, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(parameters),
      });

      const data = await res.json();

      return data;
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  Object.keys(parameters).forEach((key, index1, keys) => {
    // check if not undefined
    if (parameters[key as keyof P]) {
      // check if it is an array
      if (Array.isArray(parameters[key as keyof P])) {
        // check if the array length is greater than 0
        if ((parameters[key as keyof P] as any[]).length > 0) {
          (parameters[key as keyof P] as any[]).forEach(
            (value, index2, values) => {
              request += key + '%5B%5D=' + value;
              if (index2 < values.length - 1) {
                request += '&';
              }
            },
          );
          if (index1 < keys.length - 1) {
            request += '&';
          }
          return;
        }
      }
      // check if it is an object
      if (typeof parameters[key as keyof P] === 'object') {
        const tempParamObj = parameters[key as keyof P] as Object;

        Object.keys(tempParamObj).forEach(subParamKey => {
          // check if the sub property is not falsy
          if (tempParamObj[subParamKey as keyof typeof tempParamObj]) {
            request += key + '%5B';
            request +=
              subParamKey +
              '%5D=' +
              tempParamObj[subParamKey as keyof typeof tempParamObj] +
              '&';

            if (index1 < keys.length - 1) {
              request += '&';
            }
          }
        });
        return;
      }
      // for primitives
      request += key + '=' + parameters[key as keyof P];

      if (index1 < keys.length - 1) {
        request += '&';
      }
    }
  });

  try {
    const headers = new Headers();
    if (token) {
      headers.append('Authorization', `Bearer ${token}`);
    }

    const res = await fetch(request, {
      method: method,
      headers: headers,
      signal,
    });

    const data: R = await res.json();

    return data;
  } catch (e) {
    if (signal?.aborted) {
      console.log('Request Aborted: ' + request);
      return {result: 'aborted'};
    }
    return null;
  }
}
