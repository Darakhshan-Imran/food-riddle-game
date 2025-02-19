"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import confetti from "canvas-confetti"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { riddleData, type RiddleItem } from "../lib/game-data"
import { Shuffle, Trophy, FrownIcon } from "lucide-react"


export default function FoodRiddleGame() {
  const [currentRiddle, setCurrentRiddle] = useState<RiddleItem | null>(null)
  const [options, setOptions] = useState<string[]>([])
  const [score, setScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [remainingRiddles, setRemainingRiddles] = useState<RiddleItem[]>([])
  const [userAnswer, setUserAnswer] = useState<string | null>(null)

  useEffect(() => {
    resetGame()
  }, [])

  const resetGame = () => {
    setRemainingRiddles([...riddleData])
    setScore(0)
    setGameOver(false)
    setUserAnswer(null)
    nextRiddle()
  }

  const nextRiddle = () => {
    if (remainingRiddles.length === 0) {
      endGame()
      return
    }

    const randomIndex = Math.floor(Math.random() * remainingRiddles.length)
    const newRiddle = remainingRiddles[randomIndex]
    setCurrentRiddle(newRiddle)

    const newRemainingRiddles = remainingRiddles.filter((_, index) => index !== randomIndex)
    setRemainingRiddles(newRemainingRiddles)

    const allAnswers = riddleData.map((item) => item.answer)
    const wrongOptions = allAnswers.filter((answer) => answer !== newRiddle.answer)
    const shuffledWrongOptions = wrongOptions.sort(() => Math.random() - 0.5).slice(0, 3)
    const newOptions = [...shuffledWrongOptions, newRiddle.answer].sort(() => Math.random() - 0.5)
    setOptions(newOptions)
  }

  const handleAnswer = (selectedAnswer: string) => {
    setUserAnswer(selectedAnswer)
    if (selectedAnswer === currentRiddle?.answer) {
      setScore((prevScore) => prevScore + 1)
    }
    setTimeout(() => {
      setUserAnswer(null)
      if (remainingRiddles.length === 1) {
        endGame()
      } else {
        nextRiddle()
      }
    }, 2000) // Wait for 2 seconds before moving to the next riddle
  }

  const endGame = () => {
    setGameOver(true)
    if (score >= 5) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-200 to-green-200 flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-2xl p-6 space-y-6 bg-white shadow-lg rounded-2xl">
        <h1 className="text-4xl font-bold text-center mb-6 text-purple-600">Food Riddle Game</h1>
        <div className="text-2xl font-semibold text-center mb-4 text-blue-600">Score: {score}</div>
        {gameOver ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-4">
            {score >= 5 ? (
              <>
                <h2 className="text-3xl font-bold text-green-600">Congratulations!</h2>
                <Trophy className="mx-auto h-24 w-24 text-yellow-400" />
                <p className="text-2xl text-purple-600">Your final score: {score}</p>
              </>
            ) : (
              <>
                <h2 className="text-3xl font-bold text-red-600">You lose the game</h2>
                <FrownIcon className="mx-auto h-24 w-24 text-red-400" />
                <p className="text-2xl text-purple-600">Your score: {score}</p>
                <p className="text-xl text-blue-600">Keep trying, you'll do better next time!</p>
              </>
            )}
            <Button onClick={resetGame} className="mt-4 bg-blue-500 hover:bg-blue-600 text-white">
              Play Again
            </Button>
          </motion.div>
        ) : (
          <AnimatePresence mode="wait">
            {currentRiddle && (
              <motion.div
                key={currentRiddle.riddle}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <Image
                  src={currentRiddle.image || "/placeholder.svg"}
                  alt="Food item"
                  width={200}
                  height={200}
                  className="mx-auto rounded-lg shadow-md"
                />
                <p className="text-xl mb-4 text-center text-indigo-700">{currentRiddle.riddle}</p>
                <div className="grid grid-cols-2 gap-4">
                  {options.map((option) => (
                    <Button
                      key={option}
                      onClick={() => handleAnswer(option)}
                      className={`text-lg py-6 ${
                        userAnswer
                          ? option === currentRiddle.answer
                            ? "bg-green-500 hover:bg-green-600"
                            : option === userAnswer
                              ? "bg-red-500 hover:bg-red-600"
                              : "bg-orange-400 hover:bg-orange-500"
                          : "bg-orange-400 hover:bg-orange-500"
                      } text-white`}
                      disabled={userAnswer !== null}
                    >
                      {option}
                    </Button>
                  ))}
                </div>
                {userAnswer && (
                  <motion.p
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`text-center text-xl font-bold ${
                      userAnswer === currentRiddle.answer ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {userAnswer === currentRiddle.answer ? "Correct!" : "Oops! Try again next time."}
                  </motion.p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </Card>
      {!gameOver && currentRiddle && (
        <Card className="w-full max-w-2xl mt-6 p-6 bg-blue-100 shadow-md rounded-xl">
          <h3 className="text-2xl font-semibold mb-2 text-green-600">Did you know?</h3>
          <p className="text-lg text-purple-700">{currentRiddle.benefit}</p>
        </Card>
      )}
      <Button onClick={resetGame} className="mt-6 bg-green-500 hover:bg-green-600 text-white">
        <Shuffle className="mr-2 h-4 w-4" /> Shuffle and Restart
      </Button>
    </div>
  )
}

