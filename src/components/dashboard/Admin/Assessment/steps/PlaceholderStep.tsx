export default function PlaceholderStep({ title }: { title: string }) {
  return (
    <div className="pt-8">
      <h2 className="text-3xl font-bold text-[#1f1f24] mb-8 ">{title}</h2>
      <div className="p-8 border border-dashed border-[#e9e9ef] rounded-xl flex items-center justify-center text-[#a0a0b0]">
        Form for {title} goes here.
      </div>
    </div>
  );
}
