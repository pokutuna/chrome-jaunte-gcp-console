import {describe, expect, test} from 'vitest';

import {ServiceDef, buildUrl, matchUrl, patternParams} from './catalog.ts';

const services: ServiceDef[] = [
  {
    id: 'run',
    name: 'Cloud Run',
    pages: [
      {
        id: 'run.top',
        name: 'Services',
        pattern: '/run',
      },
      {
        id: 'run.service',
        name: 'Service',
        pattern: '/run/detail/:region/:service',
        resource: {kind: 'Service', nameParam: 'service'},
      },
    ],
  },
  {
    id: 'appengine',
    name: 'App Engine',
    pages: [
      {
        id: 'appengine.versions',
        name: 'Versions',
        pattern: '/appengine/versions',
        query: {serviceId: ':service'},
        resource: {kind: 'Service', nameParam: 'service'},
      },
    ],
  },
];

describe('matchUrl', () => {
  test('matches a resource page and captures params', () => {
    const hit = matchUrl(
      services,
      'https://console.cloud.google.com/run/detail/asia-northeast1/my-api/metrics?project=proj-1',
    );
    expect(hit).toEqual({
      pageId: 'run.service',
      params: {region: 'asia-northeast1', service: 'my-api'},
      project: 'proj-1',
    });
  });

  test('prefers the most specific pattern', () => {
    const hit = matchUrl(
      services,
      'https://console.cloud.google.com/run/detail/us-central1/svc',
    );
    expect(hit?.pageId).toBe('run.service');
  });

  test('falls back to the shallow page for shallow urls', () => {
    const hit = matchUrl(services, 'https://console.cloud.google.com/run');
    expect(hit?.pageId).toBe('run.top');
  });

  test('captures required query params', () => {
    const hit = matchUrl(
      services,
      'https://console.cloud.google.com/appengine/versions?project=p&serviceId=default',
    );
    expect(hit).toEqual({
      pageId: 'appengine.versions',
      params: {service: 'default'},
      project: 'p',
    });
  });

  test('rejects when a required query param is missing', () => {
    const hit = matchUrl(
      services,
      'https://console.cloud.google.com/appengine/versions?project=p',
    );
    expect(hit).toBeUndefined();
  });

  test('ignores non-console origins and invalid urls', () => {
    expect(matchUrl(services, 'https://example.com/run')).toBeUndefined();
    expect(matchUrl(services, 'not a url')).toBeUndefined();
  });
});

describe('buildUrl', () => {
  test('builds a url from params and project', () => {
    const url = buildUrl(services, {
      pageId: 'run.service',
      params: {region: 'asia-northeast1', service: 'my-api'},
      project: 'proj-1',
    });
    expect(url).toBe(
      'https://console.cloud.google.com/run/detail/asia-northeast1/my-api?project=proj-1',
    );
  });

  test('fills query params', () => {
    const url = buildUrl(services, {
      pageId: 'appengine.versions',
      params: {service: 'default'},
      project: 'p',
    });
    expect(url).toBe(
      'https://console.cloud.google.com/appengine/versions?serviceId=default&project=p',
    );
  });

  test('returns undefined on missing params or unknown page', () => {
    expect(
      buildUrl(services, {pageId: 'run.service', params: {region: 'r'}}),
    ).toBeUndefined();
    expect(buildUrl(services, {pageId: 'nope', params: {}})).toBeUndefined();
  });

  test('round-trips with matchUrl', () => {
    const url = buildUrl(services, {
      pageId: 'run.service',
      params: {region: 'us-central1', service: 'svc'},
      project: 'p',
    })!;
    expect(matchUrl(services, url)).toEqual({
      pageId: 'run.service',
      params: {region: 'us-central1', service: 'svc'},
      project: 'p',
    });
  });
});

describe('patternParams', () => {
  test('lists named params in order', () => {
    expect(patternParams('/run/detail/:region/:service')).toEqual([
      'region',
      'service',
    ]);
    expect(patternParams('/run')).toEqual([]);
  });
});
