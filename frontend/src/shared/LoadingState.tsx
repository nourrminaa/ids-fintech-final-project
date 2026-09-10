export default function LoadingState({ label = 'Loading' }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 py-16 justify-center opacity-60">
      <i className="bi bi-arrow-repeat animate-spin text-xl"></i>
      <span>{label}...</span>
    </div>
  )
}
