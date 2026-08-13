// The outlier score: how a post did relative to that account's OWN normal,
// not relative to raw view/engagement counts. A 300K-view post from an
// account that usually gets 20K is a real outlier; a 2M-view post from an
// account that always gets 2M teaches you nothing.
export function median(nums: number[]): number {
  if (nums.length === 0) return 0;
  const sorted = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

// Multiple = this post's value / the median of the same batch. Null when
// there's no meaningful baseline (no value, or nothing to compare against).
export function multipleOf(value: number, baseline: number): number | null {
  if (!value || !baseline) return null;
  return Number((value / baseline).toFixed(2));
}
