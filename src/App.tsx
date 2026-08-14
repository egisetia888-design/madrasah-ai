/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { AppRouter } from "./app/Router";
import { useSyncMigration } from "./store/useSyncMigration";

export default function App() {
  useSyncMigration();
  return <AppRouter />;
}
