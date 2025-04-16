class Survey < ApplicationRecord
  has_many :questions, dependent: :destroy
  has_many :responses, dependent: :destroy
  validates :title, presence: true

  ROLES = ['data_engineer', 'frontend_engineer', 'product_manager'].freeze

  def questions_for_role(role)
    if question_branches.present? && question_branches[role].present?
      questions.where(id: question_branches[role])
    else
      questions
    end
  end
end
