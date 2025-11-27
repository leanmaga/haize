import './HomeProductSlider.css';

export default function HomeProductSlider({ children: products }) {
  return (
    <div className="w-full min-h-[100dvh] flex overflow-x-auto hide-scrollbar slider-container">
      <div className="flex flex-none slider-animation">{products}</div>
      <div aria-hidden="true" className="flex flex-none slider-animation">
        {products}
      </div>
    </div>
  );
}
