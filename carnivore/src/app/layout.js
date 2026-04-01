export const metadata = {
  title: '30 Day Carnivore Experiment',
  description: 'Water. Coffee. Meat. 30 days of full transparency.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  )
}
