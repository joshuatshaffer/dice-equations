enum Opp
{
    Add,
    Sub,
    Mul,
    Div
};

class Exp
{
    const Opp opp;
    const Exp *const left;
    const Exp *const right;

    Exp(Opp opp, Exp *left, Exp *right)
        : opp(opp), left(left), right(right) {}

public:
};