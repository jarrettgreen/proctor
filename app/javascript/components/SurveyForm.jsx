import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';

const SurveyForm = (props) => {
  const [title, setTitle] = useState(props.survey?.title || '');
  const [description, setDescription] = useState(props.survey?.description || '');
  const [questionBranches, setQuestionBranches] = useState(props.survey?.question_branches || {});
  const [errors, setErrors] = useState([]);
  const roles = props.roles || [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const csrfToken = document.querySelector('meta[name="csrf-token"]').content;
    const url = props.survey?.id ? `/surveys/${props.survey.id}` : '/surveys';
    const method = props.survey?.id ? 'PATCH' : 'POST';
    
    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken,
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          survey: {
            title,
            description,
            question_branches: questionBranches
          }
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        window.location.href = `/surveys/${data.id}`;
      } else {
        const data = await response.json();
        setErrors(data.errors || ['An error occurred']);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setErrors(['An error occurred while submitting the form']);
    }
  };

  const handleQuestionBranchChange = (role, questionId, checked) => {
    setQuestionBranches(prev => {
      const newBranches = { ...prev };
      if (!newBranches[role]) {
        newBranches[role] = [];
      }
      
      if (checked) {
        if (!newBranches[role].includes(questionId)) {
          newBranches[role].push(questionId);
        }
      } else {
        newBranches[role] = newBranches[role].filter(id => id !== questionId);
      }
      
      return newBranches;
    });
  };

  return (
    <div className="space-y-6">
      {errors.length > 0 && (
        <div className="bg-red-50 p-4 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                {errors.length} {errors.length === 1 ? 'error' : 'errors'} prohibited this survey from being saved:
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <ul className="list-disc pl-5 space-y-1">
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
          <div className="mt-1">
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
            />
          </div>
        </div>

        <div className="mt-6">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
          <div className="mt-1">
            <textarea
              id="description"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
            />
          </div>
          <p className="mt-2 text-sm text-gray-500">
            Brief description of the survey's purpose.
          </p>
        </div>

        {props.questions && props.questions.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-medium text-gray-900">Question Branching</h3>
            <p className="mt-1 text-sm text-gray-500">
              Select which questions should be shown to each role.
            </p>
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Question
                    </th>
                    {roles.map(role => (
                      <th key={role} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {props.questions.map(question => (
                    <tr key={question.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {question.content}
                      </td>
                      {roles.map(role => (
                        <td key={role} className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={questionBranches[role]?.includes(question.id) || false}
                            onChange={(e) => handleQuestionBranchChange(role, question.id, e.target.checked)}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <a href="/surveys" className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            Cancel
          </a>
          <button
            type="submit"
            className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {props.survey?.id ? 'Update Survey' : 'Create Survey'}
          </button>
        </div>
      </form>
    </div>
  );
};

// Use a self-executing function to initialize the component
const initializeSurveyForm = () => {
  const container = document.getElementById('survey-form-container');
  if (container && !container.hasAttribute('data-react-initialized')) {
    const surveyData = JSON.parse(container.dataset.survey || '{}');
    const questionsData = JSON.parse(container.dataset.questions || '[]');
    const rolesData = JSON.parse(container.dataset.roles || '[]');
    
    // Mark as initialized to prevent double initialization
    container.setAttribute('data-react-initialized', 'true');
    
    const root = createRoot(container);
    root.render(<SurveyForm survey={surveyData} questions={questionsData} roles={rolesData} />);
  }
};

// Try to initialize immediately
initializeSurveyForm();

// Also listen for DOMContentLoaded
document.addEventListener('DOMContentLoaded', initializeSurveyForm);

// Additionally listen for turbo:load event if using Turbo
document.addEventListener('turbo:load', initializeSurveyForm);

export default SurveyForm; 