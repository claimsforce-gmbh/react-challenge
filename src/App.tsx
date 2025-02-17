import { useState } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import ClaimsList from "./pages/ClaimsList"
import ClaimDetails from "./pages/ClaimDetails"

const queryClient = new QueryClient()

type Page = "list" | "details"

function App() {
  const [currentPage, setCurrentPage] = useState<Page>("list")
  const [selectedClaimId, setSelectedClaimId] = useState<string | null>(null)

  const navigateTo = (page: Page, claimId?: string) => {
    setCurrentPage(page)
    if (claimId) setSelectedClaimId(claimId)
  }

  return (
    <QueryClientProvider client={queryClient}>
      {currentPage === "list" && <ClaimsList onSelectClaim={(id) => navigateTo("details", id)} />}
      {currentPage === "details" && selectedClaimId && (
        <ClaimDetails claimId={selectedClaimId} onBack={() => navigateTo("list")} />
      )}
    </QueryClientProvider>
  )
}

export default App
