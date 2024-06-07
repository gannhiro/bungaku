import {API_URL, endpoints, gen_error} from './types';

export async function mangadexAPI<R, P extends Object>(
  method: 'get' | 'post',
  endpoint: endpoints,
  parameters: P,
  additionalParams: string[],
  token?: string,
): Promise<(R | gen_error) | null> {
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
    if (parameters[key as keyof P]) {
      if (Array.isArray(parameters[key as keyof P])) {
        (parameters[key as keyof P] as any[]).forEach(
          (value, index2, values) => {
            request += key + '%5B%5D=' + value;
            if (index2 < values.length - 1) {
              request += '&';
            }
          },
        );
      } else if (typeof parameters[key as keyof P] === 'object') {
        const tempParamObj = parameters[key as keyof P] as Object;

        Object.keys(parameters[key as keyof P] as Object).forEach(
          subParamKey => {
            request += key + '%5B';
            request +=
              subParamKey +
              '%5D=' +
              tempParamObj[subParamKey as keyof typeof tempParamObj] +
              '&';
          },
        );
      } else {
        request += key + '=' + parameters[key as keyof P];
      }

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
    });

    const data: R = await res.json();

    return data;
  } catch (e) {
    console.log(e);
    return null;
  }
}
