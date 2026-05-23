export const getCurrentUser = async (req, res) => {
    return res.status(200).json({ user: req.user || null })
}

export const useInterviewCredits = async (req, res) => {
    try {
        const interviewCost = 25

        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized" })
        }

        if (req.user.credits < interviewCost) {
            return res.status(402).json({ message: "Not enough credits for this interview" })
        }

        req.user.credits -= interviewCost
        await req.user.save()

        return res.status(200).json({
            user: req.user,
            credits: req.user.credits,
            usedCredits: interviewCost,
        })
    } catch (error) {
        return res.status(500).json({ message: `Credit update error: ${error.message}` })
    }
}
