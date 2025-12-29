interface DetailsSectionProps {
    title: string
    description: string
  }
  
  export function DetailsSection({ title, description }: DetailsSectionProps) {
    return (
      <section id="details" className="mb-20">
        <h2 className="text-3xl font-bold mb-2">
          {title}
        </h2>
        <p className="text-gray-700">{description}</p>
      </section>
    )
  }
