/** Entry point to the Dungeon (called by the locker room's stairs-down action). */
export async function enterDungeon(): Promise<void> {
  const { runDungeon } = await import('./dungeon/index');
  await runDungeon();
}
