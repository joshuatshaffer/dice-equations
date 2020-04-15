
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