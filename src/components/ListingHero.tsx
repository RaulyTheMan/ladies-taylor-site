// Big display heading used atop the Best of Brands / Press & Media / Events
// listing pages — sits directly on the page background, no colored band.
// First word renders in Druk Wide Medium, the rest in Druk Wide Heavy.
export default function ListingHero({
  thin,
  thick,
}: {
  thin: string;
  thick: string;
}) {
  return (
    <h1 className="font-display mt-16 text-6xl leading-none text-white sm:text-7xl md:mt-20 md:text-8xl lg:text-9xl">
      <span className="font-medium">{thin}</span>{" "}
      <span className="font-black">{thick}</span>
    </h1>
  );
}
