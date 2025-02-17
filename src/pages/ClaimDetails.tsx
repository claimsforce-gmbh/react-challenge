"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
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

interface Questionnaire {
  id: string
  claimId: string
  questions: Array<{
    id: string
    text: string
    type: "multiple-choice" | "freetext"
    options?: string[]
    answer?: string
  }>
}

const fetchClaim = async (id: string): Promise<Claim | undefined> => {
  // In a real app, this would be an API call
  return exampleClaims.find((claim) => claim.id === id)
}

const fetchQuestionnaires = async (claimId: string): Promise<Questionnaire[]> => {
  // In a real app, this would be an API call
  // For now, we'll return a sample questionnaire
  return [
    {
      id: "Q001",
      claimId: claimId,
      questions: [
        {
          id: "Q001-1",
          text: "Was the damage caused by a natural disaster?",
          type: "multiple-choice",
          options: ["Yes", "No", "Unsure"],
        },
        {
          id: "Q001-2",
          text: "Please describe the extent of the damage:",
          type: "freetext",
        },
      ],
    },
  ]
}

export default function ClaimDetails({
  claimId,
  onBack,
  onCreateQuestionnaire,
}: {
  claimId: string
  onBack: () => void
  onCreateQuestionnaire: () => void
}) {
  const queryClient = useQueryClient()
  const [isEditing, setIsEditing] = useState(false)
  const [editedClaim, setEditedClaim] = useState<Claim | null>(null)

  const {
    data: claim,
    isLoading: isClaimLoading,
    error: claimError,
  } = useQuery<Claim | undefined>({
    queryKey: ["claim", claimId],
    queryFn: () => fetchClaim(claimId),
  })

  const {
    data: questionnaires,
    isLoading: isQuestionnairesLoading,
    error: questionnairesError,
  } = useQuery<Questionnaire[]>({
    queryKey: ["questionnaires", claimId],
    queryFn: () => fetchQuestionnaires(claimId),
  })

  const updateClaimMutation = useMutation({
    mutationFn: (updatedClaim: Claim) => {
      // In a real app, this would be an API call
      console.log("Updating claim:", updatedClaim)
      return Promise.resolve(updatedClaim)
    },
    onSuccess: (updatedClaim) => {
      queryClient.setQueryData(["claim", claimId], updatedClaim)
      setIsEditing(false)
    },
  })

  const updateQuestionnaireMutation = useMutation({
    mutationFn: (updatedQuestionnaire: Questionnaire) => {
      // In a real app, this would be an API call
      console.log("Updating questionnaire:", updatedQuestionnaire)
      return Promise.resolve(updatedQuestionnaire)
    },
    onSuccess: (updatedQuestionnaire) => {
      queryClient.setQueryData(["questionnaires", claimId], (oldData: Questionnaire[] | undefined) => {
        if (!oldData) return [updatedQuestionnaire]
        return oldData.map((q) => (q.id === updatedQuestionnaire.id ? updatedQuestionnaire : q))
      })
    },
  })

  if (isClaimLoading || isQuestionnairesLoading) return <div>Loading...</div>
  if (claimError || questionnairesError) return <div>An error occurred</div>
  if (!claim) return <div>Claim not found</div>

  const handleEdit = () => {
    setIsEditing(true)
    setEditedClaim(claim)
  }

  const handleSave = () => {
    if (editedClaim) {
      updateClaimMutation.mutate(editedClaim)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditedClaim(null)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (editedClaim) {
      setEditedClaim({
        ...editedClaim,
        [e.target.name]: e.target.value,
      })
    }
  }

  const handleAnswerChange = (questionnaireId: string, questionId: string, answer: string) => {
    const updatedQuestionnaire = questionnaires?.find((q) => q.id === questionnaireId)
    if (updatedQuestionnaire) {
      const updatedQuestions = updatedQuestionnaire.questions.map((q) => (q.id === questionId ? { ...q, answer } : q))
      updateQuestionnaireMutation.mutate({
        ...updatedQuestionnaire,
        questions: updatedQuestions,
      })
    }
  }

  return (
    <div className="container mx-auto p-4">
      <Button onClick={onBack} className="mb-4">
        Back to Claims List
      </Button>
      <h1 className="text-2xl font-bold mb-4">Claim Details: {claim.id}</h1>
      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="questionnaires">Questionnaires</TabsTrigger>
        </TabsList>
        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Claim Information</CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="damageDate">Damage Date</Label>
                    <Input
                      id="damageDate"
                      name="damageDate"
                      value={editedClaim?.damageDate}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="damageAddress">Damage Address</Label>
                    <Input
                      id="damageAddress"
                      name="damageAddress"
                      value={editedClaim?.damageAddress}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="payoutRecommendation">Payout Recommendation</Label>
                    <Input
                      id="payoutRecommendation"
                      name="payoutRecommendation"
                      type="number"
                      value={editedClaim?.payoutRecommendation}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="expertNotes">Expert Notes</Label>
                    <Textarea
                      id="expertNotes"
                      name="expertNotes"
                      value={editedClaim?.expertNotes}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="mt-4 space-x-2">
                    <Button onClick={handleSave}>Save</Button>
                    <Button variant="outline" onClick={handleCancel}>
                      Cancel
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <p>
                    <strong>Damage Date:</strong> {claim.damageDate}
                  </p>
                  <p>
                    <strong>Damage Address:</strong> {claim.damageAddress}
                  </p>
                  <p>
                    <strong>Payout Recommendation:</strong> ${claim.payoutRecommendation}
                  </p>
                  <Button onClick={handleEdit} className="mt-4">
                    Edit Claim
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Policyholder Information</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                <strong>Name:</strong> {claim.policyholder.name}
              </p>
              <p>
                <strong>Address:</strong> {claim.policyholder.address}
              </p>
              <p>
                <strong>Email:</strong> {claim.policyholder.email}
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="questionnaires">
          <Card>
            <CardHeader>
              <CardTitle>Questionnaires</CardTitle>
            </CardHeader>
            <CardContent>
              {questionnaires && questionnaires.length > 0 ? (
                questionnaires.map((questionnaire) => (
                  <div key={questionnaire.id} className="mb-4">
                    <h3 className="text-lg font-semibold">Questionnaire {questionnaire.id}</h3>
                    {questionnaire.questions.map((question) => (
                      <div key={question.id} className="ml-4 mt-2">
                        <p>
                          <strong>{question.text}</strong>
                        </p>
                        {question.type === "multiple-choice" ? (
                          <RadioGroup
                            value={question.answer}
                            onValueChange={(value) => handleAnswerChange(questionnaire.id, question.id, value)}
                          >
                            {question.options?.map((option) => (
                              <div key={option} className="flex items-center space-x-2">
                                <RadioGroupItem value={option} id={`${question.id}-${option}`} />
                                <Label htmlFor={`${question.id}-${option}`}>{option}</Label>
                              </div>
                            ))}
                          </RadioGroup>
                        ) : (
                          <Textarea
                            value={question.answer || ""}
                            onChange={(e) => handleAnswerChange(questionnaire.id, question.id, e.target.value)}
                            placeholder="Enter your answer"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                ))
              ) : (
                <p>No questionnaires available for this claim.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

