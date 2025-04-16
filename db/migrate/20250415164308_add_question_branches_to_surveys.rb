class AddQuestionBranchesToSurveys < ActiveRecord::Migration[7.0]
  def change
    add_column :surveys, :question_branches, :jsonb, default: {}
  end
end
