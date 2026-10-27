import { ReactNode } from "react"

interface Props {
  children: ReactNode
}

export const Card = ({ children }: Props) => {
  return (
    <div className="rounded-lg bg-surface border border-border overflow-hidden">
      {children}
    </div>
  )
}

export const CardHeader = ({ children }: Props) => {
  return (
    <div className="px-4 py-3 border-b border-border">
      {children}
    </div>
  )
}

export const CardTitle = ({ children }: Props) => {
  return (
    <h3 className="text-md font-semibold text-foreground">
      {children}
    </h3>
  )
}

export const CardContent = ({ children }: Props) => {
  return (
    <div className="p-4">
      {children}
    </div>
  )
}

export const CardFooter = ({ children }: Props) => {
  return (
    <div className="p-4 border-t border-border">
      {children}
    </div>
  )
}
