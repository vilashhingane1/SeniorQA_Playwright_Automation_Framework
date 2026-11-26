import { InventoryPage } from '../pages/inventory.page';
import { applications } from '../utils/applications';
import { test } from './fixtures/role.fixture';

test.use({ userRole: 'performance_glitch_user' });

test(
  'performance-glitch user can reach inventory within a local tolerance',
  { tag: [applications.saucedemo.tags[0], '@regression'] },
  async ({ rolePage }) => {
    test.setTimeout(60_000);
    await new InventoryPage(rolePage).expectLoaded();
  },
);
