import math


def choose(n, k):
    return math.factorial(n) / (math.factorial(k) * math.factorial(n - k))


def dice(n, s):
    return lambda x: (1 / math.factorial(n-1)) * sum([(-1)**k * choose(n, k) * ((x/s) - k)**(n - 1) for k in range(0, math.floor(x/s) + 1)])
