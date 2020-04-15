
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


add xs ys = Map.fromListWith (+) [ (xk + yk, xv + yv) 
                                 | (xk, xv) <- Map.toAscList xs
                                 , (yk, yv) <- Map.toAscList ys
                                 ]

dieEvents s = Map.fromAscList $ zip [1..s] (repeat 1)

diceEvents n s | n == 1 = dieEvents s
               | even n = let d = diceEvents (n `div` 2) s in add d d
               | otherwise = add (diceEvents (n-1) s) (dieEvents s)

normalizeEvents xs = Map.map (% total) xs
  where
    total = Map.foldl (+) 0 xs