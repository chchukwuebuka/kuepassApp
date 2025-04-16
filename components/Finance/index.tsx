'use client';
import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/utils/utils';
import styles from './styles.module.css';

interface Transaction {
  title: string;
  amount: number;
  date: string;
}

const transactions: Transaction[] = [
  { title: 'Robbin Nelson', amount: 25000, date: 'March 20, 2024 10:00 PM' },
  { title: 'Robbin Nelson', amount: -25000, date: 'March 20, 2024 10:00 PM' },
  { title: 'Robbin Nelson', amount: 25000, date: 'March 20, 2024 10:00 PM' },
  { title: 'Robbin Nelson', amount: -25000, date: 'March 20, 2024 10:00 PM' },
  { title: 'Robbin Nelson', amount: 25000, date: 'March 20, 2024 10:00 PM' },
  { title: 'Robbin Nelson', amount: -25000, date: 'March 20, 2024 10:00 PM' },
  { title: 'Robbin Nelson', amount: -25000, date: 'March 20, 2024 10:00 PM' },
  { title: 'Robbin Nelson', amount: -25000, date: 'March 20, 2024 10:00 PM' },
  { title: 'Robbin Nelson', amount: -25000, date: 'March 20, 2024 10:00 PM' },
  { title: 'Robbin Nelson', amount: -25000, date: 'March 20, 2024 10:00 PM' },
  { title: 'Robbin Nelson', amount: -25000, date: 'March 20, 2024 10:00 PM' },
  { title: 'Robbin Nelson', amount: -25000, date: 'March 20, 2024 10:00 PM' },
];

export default function Finance() {
  const [page, setPage] = useState(1);
  const perPage = 10;
  const totalPages = Math.ceil(transactions.length / perPage);
  const paginatedTransactions = transactions.slice(
    (page - 1) * perPage,
    page * perPage
  );

  return (
    <div className={styles.container}>
      {/* Cards Section */}
      <div className={styles.dashboardGrid}>
        {/* Card 1 */}
        <div className={styles.col}>
          <div className={styles.paper}>
            <div className={styles.cardContent}>
              <div>
                <p className={styles.textGray500}>Total Revenue</p>
                <h3 className={styles.title}>₦505,000</h3>
              </div>
              <button className={styles.withdrawButton}>Withdraw</button>
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div className={styles.col}>
          <div className={styles.paper}>
            <div className={styles.cardContentSimple}>
              <p className={styles.textGray500}>Total Tickets Sold</p>
              <h3 className={styles.title}>5000</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction History Table */}
      <h3 className={styles.transactionHeading}>Transaction History</h3>
      <table className={styles.table}>
        <thead >
          <tr className={`${styles.trName} ${styles.trHistory}`}>
            <th className={styles.th}>Title</th>
            <th className={styles.th}>Amount</th>
            <th className={styles.th}>Date</th>
          </tr>
        </thead>
        <tbody>
          {paginatedTransactions.map((transaction, index) => (
            <tr key={index} className={styles.trName} >
              <td>{transaction.title}</td>
              <td>
                <p
                  className={cn(
                    styles.fontSemibold,
                    transaction.amount > 0
                      ? styles.positiveAmount
                      : styles.negativeAmount
                  )}
                >
                  {transaction.amount > 0
                    ? `₦${transaction.amount}`
                    : `₦${-transaction.amount}`}
                </p>
              </td>
              <td>{transaction.date}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination Section */}
      <div className={styles.pagination}>
        <button
          className={styles.paginationButton}
          disabled={page === 1}
          onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
        >
          <ChevronLeft className={styles.chevron} />
        </button>
        <p>
          Page {page} of {totalPages}
        </p>
        <button
          className={styles.paginationButton}
          disabled={page === totalPages}
          onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
        >
          <ChevronRight className={styles.chevron} />
        </button>
      </div>
    </div>
  );
}
