import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

function source(path) {
  return readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
}

test('package modal uses Chinese labels for default action buttons', () => {
  const text = source('src/components/PackageModal.jsx');

  assert.match(text, /okText="确认"/);
  assert.match(text, /cancelText="取消"/);
});

test('icon-only drawer close buttons have Chinese accessible names', () => {
  const equityModal = source('src/components/EquityModal.jsx');
  const detailDrawer = source('src/components/DetailDrawer.jsx');

  assert.match(equityModal, /aria-label="关闭"/);
  assert.match(detailDrawer, /aria-label="关闭"/);
});
