export default function align(value: number, alignment: number) {
  return (value + (alignment - 1)) & ~(alignment - 1)
}
