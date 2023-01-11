
{-
expr := term + term | term
term := factor * factor | factor
factor := (expr) | int

expr := term + term | term - term | term
term := factor * factor | factor / factor | factor
factor := (expr) | int

expr := term + term | term - term | term
term := factor * factor | factor / factor | factor
factor' := d-opp | factor
factor := (expr) | int

d-opp := factor d factor | d factor

-}

import qualified Data.Map.Strict as Map
import Data.Ratio
import System.Environment 

type Foo a b = Lit a
             | Add (Foo a b) (Foo a b)
             | Sub (Foo a b) (Foo a b)
             | Mul (Foo a b) (Foo a b)
             | Div (Foo a b) (Foo a b)
             | Die (Foo b b) (Foo b b)

eval :: (Fractional a, Integral b) => Foo a b -> a
eval (Lit x) = x
eval (x `Add` y) = eval x + eval y
eval (x `Sub` y) = eval x - eval y
eval (x `Mul` y) = eval x * eval y
eval (x `Div` y) = eval x / eval y
eval (x `Die` y) = undefined


{-
To compute and store probibility distributions we use Maps where the value of an event is the key and the probability of the event is the value.
-}

opp o x y = Map.fromListWith (+) [ (o xk yk, xv * yv) 
                                 | (xk, xv) <- Map.toAscList x
                                 , (yk, yv) <- Map.toAscList y
                                 ]

add = opp (+)
sub = opp (-)
mul = opp (*)
div' = opp div
lit :: (Integral a, Integral b) => a -> Map.Map a (Ratio b)
lit n = Map.fromAscList [(n, 1)]

-- An efficiant way to add something to itself n times.
mulFromAdd :: Integral i => (a -> a -> a) -> i -> a -> a
mulFromAdd (.+) n x
  | n <= 0 = undefined
  | n == 1 = x
  | even n = mulFromAdd (.+) (n `div` 2) (x .+ x)
  | otherwise = (mulFromAdd (.+) (n - 1) x) .+ x

dieEvents s = Map.fromAscList $ zip [1..s] (repeat $ 1 % s)

diceEvents n s = mulFromAdd add n $ dieEvents s


computePmf :: (Fractional a, Integral b) => Foo a b -> a
computePmf (Lit x) = x
computePmf (x `Add` y) = computePmf x `add` computePmf y
computePmf (x `Sub` y) = computePmf x `sub` computePmf y
computePmf (x `Mul` y) = computePmf x `mul` computePmf y
computePmf (x `Div` y) = computePmf x `div'` computePmf y
computePmf (x `Die` y) = undefined


main = do
  [n, s] <- getArgs
  print $ diceEvents (read n :: Integer) (read s :: Integer)