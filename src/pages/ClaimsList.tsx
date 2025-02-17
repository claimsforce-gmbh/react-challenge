"use client"

import { useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { exampleClaims } from "../data/exampleClaims"
import { experts } from "../data/experts"

interface Claim {
  id: string
  damageDate: string
  damageAddress: string
  payoutRecommendation: number
  policyholder: {
    name: string
    address: string
    email: string
  }
  assignedExpertId: string | null
  expertNotes: string
}

const fetchClaims = async (): Promise<Claim[]> => {
  // In a real app, this would be an API call
  return exampleClaims
}

export default function ClaimsList({ onSelectClaim }: { onSelectClaim: (id: string) => void }) {
  const queryClient = useQueryClient()
  const {
    data: claims,
    isLoading,
    error,
  } = useQuery<Claim[]>({
    queryKey: ["claims"],
    queryFn: fetchClaims,
  })
  const [selectedExpert, setSelectedExpert] = useState<string>("all")
  const [selectedClaimForAssignment, setSelectedClaimForAssignment] = useState<Claim | null>(null)
  const [expertNotes, setExpertNotes] = useState("")
  const [selectedExpertForAssignment, setSelectedExpertForAssignment] = useState<string>("")

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>An error occurred: {error.toString()}</div>

  const filteredClaims =
    selectedExpert === "all"
      ? claims
      : selectedExpert === "unassigned"
        ? claims?.filter((claim) => claim.assignedExpertId === null)
        : claims?.filter((claim) => claim.assignedExpertId === selectedExpert)

  const assignExpert = () => {
    if (selectedClaimForAssignment && selectedExpertForAssignment) {
      // In a real app, this would be an API call to update the claim
      console.log(`Assigning expert ${selectedExpertForAssignment} to claim ${selectedClaimForAssignment.id}`)
      console.log(`Expert notes: ${expertNotes}`)
      // Update the claim in the local state (this should be handled by the backend in a real app)
      const updatedClaims = claims?.map((claim) =>
        claim.id === selectedClaimForAssignment.id
          ? { ...claim, assignedExpertId: selectedExpertForAssignment, expertNotes: expertNotes }
          : claim,
      )
      // Invalidate and refetch the claims query to update the UI
      queryClient.setQueryData(["claims"], updatedClaims)
    }
    setSelectedClaimForAssignment(null)
    setExpertNotes("")
    setSelectedExpertForAssignment("")
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Insurance Claims</h1>
      <div className="mb-4">
        <Label htmlFor="expert-filter">Filter by Expert</Label>
        <Select onValueChange={setSelectedExpert} value={selectedExpert}>
          <SelectTrigger id="expert-filter">
            <SelectValue placeholder="All Experts" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Experts</SelectItem>
            <SelectItem value="unassigned">Unassigned</SelectItem>
            {experts.map((expert) => (
              <SelectItem key={expert.id} value={expert.id}>
                {expert.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Damage Date</TableHead>
            <TableHead>Policyholder</TableHead>
            <TableHead>Assigned Expert</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredClaims?.map((claim) => (
            <TableRow key={claim.id}>
              <TableCell>{claim.id}</TableCell>
              <TableCell>{claim.damageDate}</TableCell>
              <TableCell>{claim.policyholder.name}</TableCell>
              <TableCell>{experts.find((e) => e.id === claim.assignedExpertId)?.name || "Unassigned"}</TableCell>
              <TableCell>
                <Button onClick={() => onSelectClaim(claim.id)} className="mr-2">
                  View Details
                </Button>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" onClick={() => setSelectedClaimForAssignment(claim)}>
                      Assign Expert
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Assign Expert to Claim {claim.id}</DialogTitle>
                    </DialogHeader>
                    <Select onValueChange={setSelectedExpertForAssignment} value={selectedExpertForAssignment}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an expert" />
                      </SelectTrigger>
                      <SelectContent>
                        {experts.map((expert) => (
                          <SelectItem key={expert.id} value={expert.id}>
                            {expert.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Textarea
                      placeholder="Enter notes for the expert"
                      value={expertNotes}
                      onChange={(e) => setExpertNotes(e.target.value)}
                    />
                    <Button onClick={assignExpert}>Assign Expert</Button>
                  </DialogContent>
                </Dialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

