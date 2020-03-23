import * as util from './util';

test('escapeXML', () => {
  expect(util.escapeXML('IAM & Admin')).toBe('IAM &amp; Admin');
  expect(util.escapeXML('<element attribute="value" />')).toBe(
    '&lt;element attribute=&quot;value&quot; /&gt;'
  );
});

test('wrapMatchedWord', () => {
  const cases: {
    text: string;
    word: string;
    w: [string, string];
    expect: string;
  }[] = [
    {
      text: 'hello',
      word: 'hell',
      w: ['<dim>', '</dim>'],
      expect: '<dim>hell</dim>o',
    },
    {
      text: 'hello',
      word: 'l',
      w: ['<l>', ''],
      expect: 'he<l>llo',
    },
    {
      text: 'hello',
      word: 'foo',
      w: ['<w>', '</w>'],
      expect: 'hello',
    },
    {
      text: 'hello',
      word: 'lo',
      w: ['<w>', '</w>'],
      expect: 'hel<w>lo</w>',
    },
  ];

  cases.forEach(c =>
    expect(util.wrapMatchedWord(c.text, c.word, c.w)).toBe(c.expect)
  );
});

test('extractURL', () => {
  const cases: [string, string | undefined][] = [
    ['hello http://example.test', 'http://example.test'],
    ['hello http://example.test/', 'http://example.test/'],
    ['http://example.test:8080', 'http://example.test:8080'],
    ['foo https://example.test/foo bar', 'https://example.test/foo'],
    [
      '姉https://example.test/foo?bar=baz#123姉',
      'https://example.test/foo?bar=baz#123',
    ],
    ['http://example.test/<a href=""></a>', 'http://example.test/'],
    ['https://example.test/1 https://example.test/2', 'https://example.test/1'],
    ['hello', undefined],
  ];

  cases.forEach(c => expect(util.extractURL(c[0])).toBe(c[1]));
});
