-- I miss Haskell.
-- I really wish it worked in the browser.

type Ast a =
  | Num a
  | Add (Ast a) (Ast a)
  | Sub (Ast a) (Ast a)
  | Div (Ast a) (Ast a)
  | Mul (Ast a) (Ast a)
  | Dice (Ast a) (Ast a)

simplify :: Num a => Ast a -> Ast a
simplify Dice x 1 = x

simplify Add x (Add y z) = Add (Add x y) z
simplify Mul x (Mul y z) = Mul (Mul x y) z

simplify o@(Add (Dice x0 (Num y0)) (Dice x1 (Num y1))) =
  if y0 === y1
    then Dice (Add x0 x1) y0
    else o

simplify Add (Num x) (Num y) = Num (x + y)
simplify Sub (Num x) (Num y) = Num (x - y)
simplify Mul (Num x) (Num y) = Num (x * y)
simplify Div (Num x) (Num y)
    | isInt x && isInt y =
      case reduceFraction x y of
        (x', 1 ) -> Num x'
        (x', y') -> Div (Num x') (Num y')
    | otherwise = Num (x / y)

simplify Add  x y = Add  (simplify x) (simplify y)
simplify Sub  x y = Sub  (simplify x) (simplify y)
simplify Mul  x y = Mul  (simplify x) (simplify y)
simplify Div  x y = Div  (simplify x) (simplify y)
simplify Dice x y = Dice (simplify x) (simplify y)
simplify x = x