class SurveysController < ApplicationController
  before_action :set_survey, only: [:show, :edit, :update, :destroy, :take, :submit]
  before_action :set_roles, only: [:take, :edit]
  
  def index
    @surveys = Survey.all
  end

  def show
  end

  def new
    @survey = Survey.new
  end

  def create
    @survey = Survey.new(survey_params)

    respond_to do |format|
      if @survey.save
        format.html { redirect_to @survey, notice: 'Survey was successfully created.' }
        format.json { render json: { id: @survey.id }, status: :created }
      else
        format.html { render :new, status: :unprocessable_entity }
        format.json { render json: { errors: @survey.errors.full_messages }, status: :unprocessable_entity }
      end
    end
  end
  
  def edit
    @questions = @survey.questions.order(:position)
  end
  
  def update
    if @survey.update(survey_params)
      respond_to do |format|
        format.html { redirect_to @survey, notice: 'Survey was successfully updated.' }
        format.json { render json: { id: @survey.id }, status: :ok }
      end
    else
      respond_to do |format|
        format.html { render :edit, status: :unprocessable_entity }
        format.json { render json: { errors: @survey.errors.full_messages }, status: :unprocessable_entity }
      end
    end
  end
  
  def destroy
    @survey.destroy
    redirect_to surveys_url, notice: 'Survey was successfully destroyed.'
  end
  
  def take
    @questions = @survey.questions.order(:position)
  end
  
  def submit
    if params[:responses].present?
      params[:responses].each do |response_params|
        @survey.responses.create(
          question_id: response_params[:question_id],
          value: response_params[:value],
        )
      end
      redirect_to surveys_path, notice: 'Thank you for completing the survey!'
    else
      redirect_to take_survey_path(@survey), alert: 'Please answer at least one question.'
    end
  end
  
  private
  
  def set_survey
    @survey = Survey.find(params[:id])
  end

  def set_roles
    @roles = Survey::ROLES
  end
  
  def survey_params
    params.require(:survey).permit(:title, :description, question_branches: {})
  end
end
