import { audio } from '../audio';

/** Musical sting (heart-up, item-get, level-up...) if the audio engine supports it. */
export function sting(id: string): void {
  (audio as unknown as { stinger?: (id: string) => void }).stinger?.(id);
}
