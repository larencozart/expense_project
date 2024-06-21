
CREATE TABLE expenses (
    id serial PRIMARY KEY,
    amount numeric(10,2) NOT NULL CHECK (amount >= 0.00),
    memo text NOT NULL,
    created_on date NOT NULL
);


INSERT INTO expenses (amount, memo, created_on)
            VALUES (3.45, "More Coffee", Now());