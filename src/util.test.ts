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
