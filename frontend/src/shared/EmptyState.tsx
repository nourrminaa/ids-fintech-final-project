export default function EmptyState({ message }: { message: string }) {
  return (
    <div className="border border-border border-dashed py-10 text-center opacity-60">
      <i className="bi bi-inbox text-2xl block mb-2"></i>
      <p>{message}</p>
    </div>
  )
}
